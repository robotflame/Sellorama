import { createBrowserRouter } from 'react-router-dom';
import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { setupAxiosInterceptors } from '../api/axiosInterceptor';
import Home from "../pages/home"
import Test from '../pages/details';
import Sell from '../pages/sell';
import NavBar from './navbar';
import Listings from '../pages/listings'
import Login from '../pages/login';
import UserProfile from '../pages/user_profile';
import SignUp from '../pages/signup';
import SignIn from '../pages/login';
import Details from '../pages/details';
import Admin from '../pages/admin';
import ChatOverview from '../pages/chatoverview';
import ChatPage from '../pages/chat';
import ThankYouPage from '../pages/confirmation'
import Edit from '../pages/edit';


export default function PageWrapper() {

  
  const navigate = useNavigate()

  useEffect(() => {
    setupAxiosInterceptors(navigate);
  }, [navigate]);

  return (
    <div>
      <NavBar />
      <div style={{ display: "flex", paddingTop: 150 }}>
        <Outlet/>
      </div>
    </div>
  )
}

export const router = createBrowserRouter([
    {
      path: '/',
      element: <PageWrapper/>,
      children: [
        {
          path: '/',
          element: <Listings/>
        },
        {
          path: '/listings/details/:id',
          element: <Details/>
        },
        {
          path: '/listings/edit/:id',
          element: <Edit/>
        },
        {
          path: '/sell',
          element: <Sell/>
        },
        {
          path: '/profile/:id',
          element: <UserProfile/>
        },
        {
          path: '/signin',
          element: <SignIn/>
        },
        {
          path: '/signup',
          element: <SignUp/>
        },
        {
          path: '/admin',
          element: <Admin/>
        },
        {
          path: '/chat',
          element: <ChatOverview/>
        },
        {
          path: '/chat/:userId',
          element: <ChatPage/>
        },
        {
          path: '/confirmation/:id',
          element: <ThankYouPage/>
        }
      ]
    },
  ]);