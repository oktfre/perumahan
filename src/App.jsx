import { useEffect, useState } from "react";
import { AuthProvider, useAuth }    from "./context/AuthContext";
import { CmsProvider }              from "./context/CmsContext";
import CSS                          from "./styles/global";
import Navbar      from "./components/Navbar";
import HomePage    from "./components/home/HomePage";
import ListingPage from "./components/listing/ListingPage";
import DetailPage  from "./components/detail/DetailPage";
import ContactPage from "./components/contact/ContactPage";
import BookingPage from "./components/booking/BookingPage";
import LoginPage   from "./components/auth/LoginPage";
import AdminPage   from "./components/admin/AdminPage";
import Btn         from "./components/atoms/Btn";

function AboutPage({ setPage }) {
  return (
    <div style={{ minHeight:"100vh", paddingTop:80, display:"flex", alignItems:"center", justifyContent:"center" }} className="page-enter">
      <div style={{ textAlign:"center", padding:"4rem" }}>
        <div style={{ fontFamily:"var(--serif)", fontSize:"3rem", color:"var(--clay)", marginBottom:"1rem" }}>Tentang Kami</div>
        <div style={{ fontSize:"1rem", color:"var(--light)", marginBottom:"2rem" }}>Halaman ini sedang dalam pengembangan.</div>
        <Btn onClick={() => setPage("home")}>← Kembali ke Beranda</Btn>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight:"100vh", background:"var(--espresso)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontFamily:"var(--serif)", fontSize:"1.8rem", color:"var(--clay)", letterSpacing:".12em", animation:"pulse 1.5s ease-in-out infinite" }}>
        HAVENEST
      </div>
    </div>
  );
}

function AdminGuard({ setPage, children }) {
  const { isAdmin, loading } = useAuth();
  useEffect(() => { if (!loading && !isAdmin) setPage("login"); }, [isAdmin, loading, setPage]);
  if (loading) return <LoadingScreen />;
  if (!isAdmin) return null;
  return children;
}

const PUBLIC_PAGES = ["home","listing","detail","contact","about","booking"];

function AppInner() {
  const { loading }                     = useAuth();
  const [page,         setPage]         = useState("home");
  const [selectedProp, setSelectedProp] = useState(null);
  const [bookingProp,  setBookingProp]  = useState(null);

  const navigate = (p) => { setPage(p); window.scrollTo({ top:0, behavior:"smooth" }); };
  const goBooking = (prop) => { setBookingProp(prop || null); navigate("booking"); };

  if (loading) return <LoadingScreen />;

  // Admin — layout terpisah
  if (page === "admin") {
    return (
      <AdminGuard setPage={navigate}>
        <style>{CSS}</style>
        <AdminPage setPage={navigate} />
      </AdminGuard>
    );
  }

  // Login
  if (page === "login") return <><style>{CSS}</style><LoginPage setPage={navigate} /></>;

  // Publik
  return (
    <>
      <style>{CSS}</style>
      <Navbar page={page} setPage={navigate} />
      {page === "home"    && <HomePage    setPage={navigate} setSelectedProp={setSelectedProp} />}
      {page === "listing" && <ListingPage setPage={navigate} setSelectedProp={setSelectedProp} />}
      {page === "detail"  && selectedProp && <DetailPage prop={selectedProp} setPage={navigate} goBooking={goBooking} />}
      {page === "contact" && <ContactPage setPage={navigate} />}
      {page === "booking" && <BookingPage setPage={navigate} presetProperty={bookingProp} />}
      {page === "about"   && <AboutPage   setPage={navigate} />}
      {!PUBLIC_PAGES.includes(page) && navigate("home")}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CmsProvider>
        <AppInner />
      </CmsProvider>
    </AuthProvider>
  );
}
