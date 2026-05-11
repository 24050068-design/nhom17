import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import AuthPage from './pages/AuthPage';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import StaticPage from './pages/StaticPage';
import PostsManager from './pages/admin/PostsManager';
import CategoriesManager from './pages/admin/CategoriesManager';
import UsersManager from './pages/admin/UsersManager';
import CommentsManager from './pages/admin/CommentsManager';
import NewsManager from './pages/admin/NewsManager';
import NewsEditor from './pages/admin/NewsEditor';
import OrdersManager from './pages/admin/OrdersManager';
import QuangCaoPage from './pages/QuangCaoPage';
import DatBaoPage from './pages/DatBaoPage';
import OAuthCallback from './pages/OAuthCallback';

function MainLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/page/:slug" element={<StaticPage />} />
          <Route path="/quang-cao" element={<QuangCaoPage />} />
          <Route path="/dat-bao" element={<DatBaoPage />} />
          {/* Auth pages */}
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          {/* OAuth callback — backend redirects đến đây sau khi xác thực */}
          <Route path="/oauth-callback" element={<OAuthCallback />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Admin panel */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="posts" element={<PostsManager />} />
            <Route path="news" element={<NewsManager />} />
            <Route path="news/create" element={<NewsEditor />} />
            <Route path="news/edit/:id" element={<NewsEditor />} />
            <Route path="categories" element={<CategoriesManager />} />
            <Route path="users" element={<UsersManager />} />
            <Route path="comments" element={<CommentsManager />} />
            <Route path="orders"   element={<OrdersManager />} />
          </Route>

          {/* Main site with header/footer */}
          <Route path="/*" element={<MainLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
