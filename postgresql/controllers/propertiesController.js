// controllers/propertiesController.js  —  PostgreSQL
'use strict';
const db = require('../db');

const BASE_SELECT = `
  SELECT t.id, p.id AS perumahan_id, p.nama AS perumahan, p.lokasi,
    t.nomor_tipe, t.nama_properti, t.badge, t.tipe_properti,
    t.luas_tanah_lebar_m, t.luas_tanah_panjang_m, t.luas_tanah_m2, t.lebar_jalan_m,
    t.jumlah_kamar_tidur AS kamar_tidur, t.jumlah_kamar_mandi AS kamar_mandi,
    COALESCE(t.luas_bangunan_m2, 36) AS luas_bangunan_m2, t.jumlah_lantai, t.sumber_air, t.daya_listrik_watt,
    t.harga_jual_juta, t.dp_awal_juta, t.unit_tersedia, t.status,
    t.deskripsi, t.fasilitas, t.lat, t.lng, t.created_at, t.updated_at,
    STRING_AGG(DISTINCT a.tenor_tahun::TEXT, ',' ORDER BY a.tenor_tahun::TEXT) AS opsi_tenor,
    (SELECT pi.url FROM property_images pi WHERE pi.tipe_unit_id=t.id AND pi.is_primary=TRUE LIMIT 1) AS gambar_utama,
    COALESCE((SELECT JSON_AGG(JSON_BUILD_OBJECT('id',pi.id,'url',pi.url,'caption',pi.caption,'sort_order',pi.sort_order,'is_primary',pi.is_primary) ORDER BY pi.sort_order,pi.id) FROM property_images pi WHERE pi.tipe_unit_id=t.id),'[]'::JSON) AS gambar
  FROM tipe_unit t JOIN perumahan p ON p.id=t.perumahan_id JOIN opsi_angsuran a ON a.tipe_unit_id=t.id
`;
const BASE_GROUP = ` GROUP BY t.id,p.id,p.nama,p.lokasi,t.nomor_tipe,t.nama_properti,t.badge,t.tipe_properti,t.luas_tanah_lebar_m,t.luas_tanah_panjang_m,t.luas_tanah_m2,t.lebar_jalan_m,t.jumlah_kamar_tidur,t.jumlah_kamar_mandi,COALESCE(t.luas_bangunan_m2, 36),t.jumlah_lantai,t.sumber_air,t.daya_listrik_watt,t.harga_jual_juta,t.dp_awal_juta,t.unit_tersedia,t.status,t.deskripsi,t.fasilitas,t.lat,t.lng,t.created_at,t.updated_at`;

function buildWhere(f) {
  const conds=[],params=[];let i=1;
  if(f.search){conds.push(`(t.nama_properti ILIKE $${i} OR p.nama ILIKE $${i} OR p.lokasi ILIKE $${i})`);params.push(`%${f.search}%`);i++;}
  if(f.status){conds.push(`t.status=$${i++}`);params.push(f.status);}
  if(f.kamar_tidur){conds.push(`t.jumlah_kamar_tidur>=$${i++}`);params.push(+f.kamar_tidur);}
  if(f.harga_min){conds.push(`t.harga_jual_juta>=$${i++}`);params.push(+f.harga_min);}
  if(f.harga_max){conds.push(`t.harga_jual_juta<=$${i++}`);params.push(+f.harga_max);}
  if(f.perumahan_id){conds.push(`p.id=$${i++}`);params.push(+f.perumahan_id);}
  return{clause:conds.length?'WHERE '+conds.join(' AND '):'',params};
}
const SORT_MAP={'harga_asc':'t.harga_jual_juta ASC','harga_desc':'t.harga_jual_juta DESC','terluas':'t.luas_tanah_m2 DESC','terbaru':'t.id DESC','default':'p.nama ASC,t.nomor_tipe ASC'};
const norm=r=>({...r,opsi_tenor:r.opsi_tenor?r.opsi_tenor.split(',').map(Number):[],fasilitas:Array.isArray(r.fasilitas)?r.fasilitas:[],gambar:Array.isArray(r.gambar)?r.gambar:[]});

async function getAll(req,res,next){
  try{
    const{search,status,kamar_tidur,harga_min,harga_max,perumahan_id,sort='default'}=req.query;
    const page=Math.max(1,+(req.query.page||1)),limit=Math.min(50,+(req.query.limit||12)),offset=(page-1)*limit;
    const{clause,params}=buildWhere({search,status,kamar_tidur,harga_min,harga_max,perumahan_id});
    const orderBy=SORT_MAP[sort]||SORT_MAP.default;
    const{rows:[{total}]}=await db.query(`SELECT COUNT(*) AS total FROM(${BASE_SELECT}${clause}${BASE_GROUP})sub`,params);
    const{rows}=await db.query(`${BASE_SELECT}${clause}${BASE_GROUP} ORDER BY ${orderBy} LIMIT $${params.length+1} OFFSET $${params.length+2}`,[...params,limit,offset]);
    res.json({success:true,pagination:{page,limit,total:+total,total_pages:Math.ceil(+total/limit)},data:rows.map(norm)});
  }catch(err){next(err);}
}
async function getTersedia(req,res,next){req.query.status='tersedia';return getAll(req,res,next);}

async function getFeatured(req,res,next){
  try{
    const limit=Math.min(12,+(req.query.limit||6));
    const{rows}=await db.query(`${BASE_SELECT} WHERE t.status='tersedia' ${BASE_GROUP} ORDER BY t.badge NULLS LAST,t.unit_tersedia DESC LIMIT $1`,[limit]);
    res.json({success:true,data:rows.map(norm)});
  }catch(err){next(err);}
}

async function getById(req,res,next){
  try{
    const{rows:[row]}=await db.query(`${BASE_SELECT} WHERE t.id=$1 ${BASE_GROUP}`,[+req.params.id]);
    if(!row)return res.status(404).json({success:false,message:'Unit tidak ditemukan.'});
    res.json({success:true,data:norm(row)});
  }catch(err){next(err);}
}

async function create(req,res,next){
  const client=await db.getClient();
  try{
    await client.query('BEGIN');
    const{perumahan_id,nomor_tipe,nama_properti,badge,tipe_properti='Rumah Tapak',luas_tanah_lebar_m,luas_tanah_panjang_m,lebar_jalan_m,jumlah_kamar_tidur,jumlah_kamar_mandi,luas_bangunan_m2=36,jumlah_lantai=1,sumber_air='Sumur Bor',daya_listrik_watt,harga_jual_juta,dp_awal_juta,unit_tersedia=0,deskripsi,fasilitas=[],lat,lng,opsi_tenor=[10,15,20]}=req.body;
    const status=+unit_tersedia>0?'tersedia':'terjual';
    const{rows:[unit]}=await client.query(`INSERT INTO tipe_unit(perumahan_id,nomor_tipe,nama_properti,badge,tipe_properti,luas_tanah_lebar_m,luas_tanah_panjang_m,lebar_jalan_m,jumlah_kamar_tidur,jumlah_kamar_mandi,luas_bangunan_m2,jumlah_lantai,sumber_air,daya_listrik_watt,harga_jual_juta,dp_awal_juta,unit_tersedia,status,deskripsi,fasilitas,lat,lng) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18::status_unit,$19,$20,$21,$22) RETURNING id`,[perumahan_id,nomor_tipe,nama_properti,badge||null,tipe_properti,luas_tanah_lebar_m,luas_tanah_panjang_m,lebar_jalan_m,jumlah_kamar_tidur,jumlah_kamar_mandi,luas_bangunan_m2!==undefined?luas_bangunan_m2:36,jumlah_lantai!==undefined?jumlah_lantai:1,sumber_air,daya_listrik_watt,harga_jual_juta,dp_awal_juta,unit_tersedia,status,deskripsi,JSON.stringify(fasilitas),lat||null,lng||null]);
    for(const t of opsi_tenor)await client.query(`INSERT INTO opsi_angsuran(tipe_unit_id,tenor_tahun)VALUES($1,$2)`,[unit.id,t]);
    await client.query('COMMIT');
    res.status(201).json({success:true,message:'Unit berhasil ditambahkan.',data:{id:unit.id}});
  }catch(err){await client.query('ROLLBACK');next(err);}finally{client.release();}
}

async function update(req,res,next){
  const client=await db.getClient();
  try{
    await client.query('BEGIN');
    const id=+req.params.id;
    const{nama_properti,badge,tipe_properti,luas_tanah_lebar_m,luas_tanah_panjang_m,lebar_jalan_m,jumlah_kamar_tidur,jumlah_kamar_mandi,luas_bangunan_m2,jumlah_lantai,sumber_air,daya_listrik_watt,harga_jual_juta,dp_awal_juta,unit_tersedia,deskripsi,fasilitas,lat,lng}=req.body;
    const{rowCount}=await client.query(`UPDATE tipe_unit SET nama_properti=$1,badge=$2,tipe_properti=$3,luas_tanah_lebar_m=$4,luas_tanah_panjang_m=$5,lebar_jalan_m=$6,jumlah_kamar_tidur=$7,jumlah_kamar_mandi=$8,luas_bangunan_m2=$9,jumlah_lantai=$10,sumber_air=$11,daya_listrik_watt=$12,harga_jual_juta=$13,dp_awal_juta=$14,unit_tersedia=$15,status=CASE WHEN $15>0 THEN 'tersedia'::status_unit ELSE 'terjual'::status_unit END,deskripsi=$16,fasilitas=$17,lat=$18,lng=$19 WHERE id=$20`,[nama_properti,badge||null,tipe_properti,luas_tanah_lebar_m,luas_tanah_panjang_m,lebar_jalan_m,jumlah_kamar_tidur,jumlah_kamar_mandi,luas_bangunan_m2!==undefined?luas_bangunan_m2:36,jumlah_lantai!==undefined?jumlah_lantai:2,sumber_air,daya_listrik_watt,harga_jual_juta,dp_awal_juta,unit_tersedia,deskripsi,JSON.stringify(fasilitas||[]),lat||null,lng||null,id]);
    if(!rowCount){await client.query('ROLLBACK');return res.status(404).json({success:false,message:'Unit tidak ditemukan.'});}
    await client.query('COMMIT');
    res.json({success:true,message:'Unit berhasil diperbarui.'});
  }catch(err){await client.query('ROLLBACK');next(err);}finally{client.release();}
}

async function updateStok(req,res,next){
  const client=await db.getClient();
  try{
    await client.query('BEGIN');
    const id=+req.params.id;const{delta,unit_tersedia}=req.body;
    const sql=unit_tersedia!==undefined?`UPDATE tipe_unit SET unit_tersedia=$1,status=CASE WHEN $1>0 THEN 'tersedia'::status_unit ELSE 'terjual'::status_unit END WHERE id=$2 RETURNING unit_tersedia,status`:`UPDATE tipe_unit SET unit_tersedia=GREATEST(0,unit_tersedia+$1),status=CASE WHEN GREATEST(0,unit_tersedia+$1)>0 THEN 'tersedia'::status_unit ELSE 'terjual'::status_unit END WHERE id=$2 RETURNING unit_tersedia,status`;
    const val=unit_tersedia!==undefined?unit_tersedia:+delta;
    const{rows:[updated],rowCount}=await client.query(sql,[val,id]);
    if(!rowCount){await client.query('ROLLBACK');return res.status(404).json({success:false,message:'Unit tidak ditemukan.'});}
    await client.query('COMMIT');
    res.json({success:true,message:'Stok diperbarui.',data:updated});
  }catch(err){await client.query('ROLLBACK');next(err);}finally{client.release();}
}

async function remove(req,res,next){
  try{
    const{rowCount}=await db.query(`DELETE FROM tipe_unit WHERE id=$1`,[+req.params.id]);
    if(!rowCount)return res.status(404).json({success:false,message:'Unit tidak ditemukan.'});
    res.json({success:true,message:'Unit berhasil dihapus.'});
  }catch(err){next(err);}
}

async function getRekap(req,res,next){
  try{
    const{rows}=await db.query(`SELECT p.nama AS perumahan,p.lokasi,COUNT(t.id) AS total_tipe,COALESCE(SUM(t.unit_tersedia),0) AS total_unit_tersedia,COUNT(*) FILTER(WHERE t.status='terjual') AS tipe_sold_out,MIN(t.harga_jual_juta) AS harga_terendah_juta,MAX(t.harga_jual_juta) AS harga_tertinggi_juta FROM perumahan p JOIN tipe_unit t ON t.perumahan_id=p.id GROUP BY p.id,p.nama,p.lokasi ORDER BY p.nama`);
    res.json({success:true,data:rows});
  }catch(err){next(err);}
}

// ── GAMBAR
async function addImage(req,res,next){
  try{
    const tid=+req.params.id;const{url,caption='',is_primary=false}=req.body;
    if(!url)return res.status(422).json({success:false,message:'URL wajib diisi.'});
    const{rows:[{mx}]}=await db.query(`SELECT COALESCE(MAX(sort_order),-1) AS mx FROM property_images WHERE tipe_unit_id=$1`,[tid]);
    const{rows:[img]}=await db.query(`INSERT INTO property_images(tipe_unit_id,url,caption,sort_order,is_primary) VALUES($1,$2,$3,$4,$5) RETURNING *`,[tid,url,caption,+mx+1,is_primary]);
    res.status(201).json({success:true,message:'Gambar ditambahkan.',data:img});
  }catch(err){next(err);}
}

async function updateImage(req,res,next){
  try{
    const id=+req.params.imgId;const{url,caption,sort_order,is_primary}=req.body;
    const sets=[],vals=[];let i=1;
    if(url!==undefined){sets.push(`url=$${i++}`);vals.push(url);}
    if(caption!==undefined){sets.push(`caption=$${i++}`);vals.push(caption);}
    if(sort_order!==undefined){sets.push(`sort_order=$${i++}`);vals.push(sort_order);}
    if(is_primary!==undefined){sets.push(`is_primary=$${i++}`);vals.push(is_primary);}
    if(!sets.length)return res.status(422).json({success:false,message:'Tidak ada field.'});
    vals.push(id);
    const{rowCount}=await db.query(`UPDATE property_images SET ${sets.join(',')} WHERE id=$${i}`,vals);
    if(!rowCount)return res.status(404).json({success:false,message:'Gambar tidak ditemukan.'});
    res.json({success:true,message:'Gambar diperbarui.'});
  }catch(err){next(err);}
}

async function deleteImage(req,res,next){
  try{
    const{rowCount}=await db.query(`DELETE FROM property_images WHERE id=$1`,[+req.params.imgId]);
    if(!rowCount)return res.status(404).json({success:false,message:'Gambar tidak ditemukan.'});
    res.json({success:true,message:'Gambar dihapus.'});
  }catch(err){next(err);}
}

async function setPrimary(req,res,next){
  try{
    const{rowCount}=await db.query(`UPDATE property_images SET is_primary=TRUE WHERE id=$1`,[+req.params.imgId]);
    if(!rowCount)return res.status(404).json({success:false,message:'Gambar tidak ditemukan.'});
    res.json({success:true,message:'Gambar utama diperbarui.'});
  }catch(err){next(err);}
}

module.exports={getAll,getTersedia,getFeatured,getById,create,update,updateStok,remove,getRekap,addImage,updateImage,deleteImage,setPrimary};
