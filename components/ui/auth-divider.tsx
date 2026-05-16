export function AuthDivider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border-light" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-white px-3 text-muted-foreground font-medium uppercase tracking-wider">
          or continue with
        </span>
      </div>
    </div>
  );
}
