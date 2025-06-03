export default function LFDWrapper({children}: {children: React.ReactNode}) {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-background gap-14 font-[family-name:var(--font-poppins)]">
			{children}
		</div>
	)
}