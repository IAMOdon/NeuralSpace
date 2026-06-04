"use client";

export function NewsletterForm() {
  // TODO: brancher sur une vraie liste (Resend / Brevo)
  return (
    <form className="flex gap-2 w-full md:w-auto" onSubmit={(e) => e.preventDefault()}>
      <input
        type="email"
        placeholder="votre@email.com"
        className="flex-1 md:w-64 px-4 py-2.5 rounded-full bg-white/10 border border-white/20 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/50 font-sans"
      />
      <button
        type="submit"
        className="px-5 py-2.5 rounded-full bg-white text-ns-blue text-sm font-sans font-semibold hover:opacity-90 transition-opacity shrink-0"
      >
        S&apos;inscrire
      </button>
    </form>
  );
}
