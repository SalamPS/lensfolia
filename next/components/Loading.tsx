export default function Loading() {
	return (
		<div className="fixed top-0 left-0 w-screen z-100 h-screen flex flex-col items-center justify-center min-h-screen bg-background/95 backdrop-blur-sm">
			<div className="animate-spin rounded-full h-32 w-32 border-t-4 border-primary"></div>
			<p className="mt-12 text-lg animate-pulse text-white">Memproses deteksi anda ...</p>
		</div>
	);
}