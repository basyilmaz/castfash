export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="bg-page text-white min-h-screen">
            {children}
        </div>
    );
}
