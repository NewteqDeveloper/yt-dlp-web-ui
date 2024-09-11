import { CircularProgress } from '@mui/material';
import { Suspense, lazy } from 'react';
import { createHashRouter } from 'react-router-dom';
import Layout from './Layout';
import Terminal from './views/Terminal';

const Home = lazy(() => import('./views/Home'));
const Login = lazy(() => import('./views/Login'));
const Archive = lazy(() => import('./views/Archive'));
const Settings = lazy(() => import('./views/Settings'));
const Restart = lazy(() => import('./views/RestartService'));
const Download = lazy(() => import('./views/Download'));

const ErrorBoundary = lazy(() => import('./components/ErrorBoundary'));

export const router = createHashRouter([
  {
    path: '/',
    Component: () => <Layout />,
    children: [
      {
        path: '/',
        element: (
          <Suspense fallback={<CircularProgress />}>
            <Home />
          </Suspense>
        ),
        errorElement: (
          <Suspense fallback={<CircularProgress />}>
            <ErrorBoundary />
          </Suspense>
        ),
      },
      {
        path: '/download',
        element: (
          <Suspense fallback={<CircularProgress />}>
            <Download />
          </Suspense>
        ),
        errorElement: (
          <Suspense fallback={<CircularProgress />}>
            <ErrorBoundary />
          </Suspense>
        ),
      },
      {
        path: '/settings',
        element: (
          <Suspense fallback={<CircularProgress />}>
            <Settings />
          </Suspense>
        ),
      },
      {
        path: '/log',
        element: (
          <Suspense fallback={<CircularProgress />}>
            <Terminal />
          </Suspense>
        ),
      },
      {
        path: '/archive',
        element: (
          <Suspense fallback={<CircularProgress />}>
            <Archive />
          </Suspense>
        ),
        errorElement: (
          <Suspense fallback={<CircularProgress />}>
            <ErrorBoundary />
          </Suspense>
        ),
      },
      {
        path: '/restart',
        element: (
          <Suspense fallback={<CircularProgress />}>
            <Restart />
          </Suspense>
        ),
        errorElement: (
          <Suspense fallback={<CircularProgress />}>
            <ErrorBoundary />
          </Suspense>
        ),
      },
      {
        path: '/login',
        element: (
          <Suspense fallback={<CircularProgress />}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: '/error',
        element: (
          <Suspense fallback={<CircularProgress />}>
            <ErrorBoundary />
          </Suspense>
        ),
      },
    ],
  },
]);
