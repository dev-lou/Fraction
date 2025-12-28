export function Footer() {
    return (
        <footer className="w-full border-t border-neutral-900 py-8 mt-auto">
            <div className="mx-auto flex w-full max-w-screen-2xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-gradient-to-br from-lime-400 to-emerald-500" />
                    <span className="text-sm font-semibold text-neutral-400">Fraction</span>
                </div>
                <div className="text-sm text-neutral-600">
                    Lou Vincent Baroro - Developer
                </div>
            </div>
        </footer>
    );
}
