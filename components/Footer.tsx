export default function Footer() {
  return (
    <footer className="border-t border-border py-8 px-6 md:px-12 mt-20">
      <div className="max-w-3xl mx-auto text-center text-muted text-sm tracking-wide">
        <p>&copy; {new Date().getFullYear()} JARVIS. All rights reserved.</p>
      </div>
    </footer>
  );
}
