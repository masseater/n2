import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { useState } from "react";

import { AuthGuard } from "../components/AuthGuard";
import Header from "../components/Header";

import appCss from "../styles.css?url";

/**
 * 認証不要なパス
 */
const PUBLIC_PATHS = ["/login", "/"];

/**
 * ヘッダーを非表示にするパス
 */
const HEADERLESS_PATHS = ["/login", "/"];

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "NippoNikki",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
});

/**
 * ルートコンポーネント
 * 認証ガードを適用（パブリックパスを除く）
 */
function RootComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const isHeaderlessPath = HEADERLESS_PATHS.some((path) => pathname === path);

  if (isPublicPath) {
    return (
      <>
        {!isHeaderlessPath && <Header />}
        <Outlet />
      </>
    );
  }

  return (
    <AuthGuard>
      <Header />
      <Outlet />
    </AuthGuard>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
