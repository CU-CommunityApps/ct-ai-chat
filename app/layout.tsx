import type React from 'react';
import './globals.scss';

export const metadata = {
  title: 'GPT Chat Demo',
  description: 'Powered by Azure OpenAI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="page-wrapper">{children}</div>
      </body>
    </html>
  );
}
