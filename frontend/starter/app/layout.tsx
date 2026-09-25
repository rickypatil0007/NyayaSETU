import './globals.css';

export const metadata = {
  title: 'NyayaSetu',
  description: 'AI-powered legal/regulatory compliance audits',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen">{children}</body>
    </html>
  );
}
