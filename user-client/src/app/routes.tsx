import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { ReviewPage } from './pages/ReviewPage';
import { VnpayReturnPage } from './pages/VnpayReturnPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: 'products', Component: ProductsPage },
      { path: 'products/:id', Component: ProductDetailPage },
      { path: 'cart', Component: CartPage },
      { path: 'checkout', Component: CheckoutPage },
      { path: 'vnpay-return', Component: VnpayReturnPage },
      { path: 'order-success/:orderId', Component: OrderSuccessPage },
      { path: 'login', Component: LoginPage },
      { path: 'register', Component: RegisterPage },
      { path: 'forgot-password', Component: ForgotPasswordPage },
      { path: 'change-password', Component: ChangePasswordPage },
      { path: 'orders', Component: OrdersPage },
      { path: 'orders/:id', Component: OrderDetailPage },
      { path: 'orders/:orderId/review', Component: ReviewPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
]);
