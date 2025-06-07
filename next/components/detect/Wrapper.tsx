export default function LFDWrapper({ children, ...rest }: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div className="flex flex-col items-center justify-center pt-32 pb-16 z-20 overflow-x-hidden gap-14"
			{...rest}>
			{children}
		</div>
	)
}