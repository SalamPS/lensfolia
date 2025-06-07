export default function LFDWrapper({ children, ...rest }: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-background py-16 overflow-x-hidden gap-14 font-[family-name:var(--font-poppins)]"
			{...rest}>
			{children}
		</div>
	)
}