import { Reveal } from "./Reveal";
import { useState } from "react";
import { trackEvent } from "@/lib/useTracker";

const links = [
  { label: "Email", value: "karndeep20047@gmail.com", href: "mailto:karndeep20047@gmail.com", event: "EMAIL_CLICK" },
  { label: "Phone", value: "+254 740 350 866", href: "tel:+254740350866", event: "PHONE_CLICK" },
  { label: "GitHub", value: "@karndeep20047-design", href: "https://github.com/karndeep20047-design", event: "GITHUB_CLICK" },
  { label: "Location", value: "Nairobi, Kenya", href: "#", event: null },
];

export function Contact() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("loading");
    setErrorMessage("");
    
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    
    // Add Web3Forms required fields
    object.access_key = "eacafbd6-e42c-4d04-a236-dc421d644ebc";
    object.subject = "New Message from Portfolio Website!";
    object.from_name = "Portfolio Contact Form";

    const json = JSON.stringify(object);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: json
      });

      const data = await response.json();

      if (response.status === 200 && data.success) {
        trackEvent("CONTACT_SUBMIT", { name: object.name, email: object.email, company: object.company });
        setStatus("success");
        form.reset();
        setTimeout(() => setStatus("idle"), 5000); // Reset after 5 seconds
      } else {
        console.error("Web3Forms Error:", data);
        setErrorMessage(data.message || "Invalid access key or domain restriction.");
        setStatus("error");
      }
    } catch (error: any) {
      console.error("Fetch Error:", error);
      setErrorMessage(error.message || "Network error. Do you have an ad blocker enabled?");
      setStatus("error");
    }
  };

  return (
    <section
      id="contact"
      className="relative overflow-hidden border-t border-border/60 px-6 pt-24 pb-8 md:px-10 md:py-40"
    >
      <div className="relative mx-auto max-w-6xl">
        <Reveal>
          <div className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            ● Contact
          </div>
        </Reveal>

        <div className="mt-8 grid gap-16 md:mt-12 md:grid-cols-2 md:gap-24">
          <div>
            <Reveal delay={0.05}>
              <h2 className="font-display text-5xl font-medium leading-[0.95] tracking-tighter md:text-7xl">
                Let's build<br />
                <span className="italic text-foreground/55">something good.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-6 max-w-sm text-base leading-relaxed text-muted-foreground md:text-lg">
                Have a project in mind or just want to say hi? I'm currently available for work and open to new opportunities.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.25} className="w-full">
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <div className="grid gap-6 sm:grid-cols-2">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  required
                  className="w-full border-b border-border/60 bg-transparent py-3 text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-foreground outline-none"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                  className="w-full border-b border-border/60 bg-transparent py-3 text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-foreground outline-none"
                />
              </div>
              <input
                type="text"
                name="company"
                placeholder="Company (optional)"
                className="w-full border-b border-border/60 bg-transparent py-3 text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-foreground outline-none"
              />
              <textarea
                name="message"
                placeholder="Message"
                required
                rows={4}
                className="w-full resize-none border-b border-border/60 bg-transparent py-3 text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-foreground outline-none"
              />
              <button
                type="submit"
                disabled={status === "loading" || status === "success"}
                className={`group mt-4 inline-flex w-fit items-center gap-4 rounded-full px-6 py-4 font-display text-base font-medium transition-all ${
                  status === "success"
                    ? "bg-emerald-500 text-white"
                    : "bg-foreground text-background hover:gap-6"
                }`}
              >
                {status === "loading" ? "Sending..." : status === "success" ? "Message Sent!" : "Send message"}
                {status !== "success" && status !== "loading" && (
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-background text-foreground transition-transform group-hover:rotate-45">
                    →
                  </span>
                )}
              </button>
              {status === "error" && (
                <p className="text-red-500 text-sm mt-2">Error: {errorMessage}</p>
              )}
            </form>
          </Reveal>
        </div>

        <div className="mt-32 grid gap-8 border-t border-border/60 pt-10 sm:grid-cols-2 md:grid-cols-4">
          {links.map((l, i) => (
            <Reveal key={l.label} delay={i * 0.05}>
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  {l.label}
                </span>
                <a
                  href={l.href}
                  target={l.label === "GitHub" ? "_blank" : undefined}
                  rel="noreferrer"
                  onClick={() => {
                    if (l.label === "GitHub") trackEvent("GITHUB_CLICK");
                  }}
                  className="link-hover w-fit text-[15px] text-foreground/90"
                >
                  {l.value}
                </a>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-24 flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-6 font-mono text-[11px] uppercase tracking-widest text-muted-foreground sm:flex-row sm:items-center">
          <span>© 2026 Karndeep Bhamrah</span>
          <span>Built with care, in Nairobi.</span>
        </div>
      </div>
    </section>
  );
}
