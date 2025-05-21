import { GalleryVerticalEnd } from "lucide-react"

import { SignUpForm } from "@/components/signup-form"

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
       <a href="https://links.hvin.tech/links" className="flex items-center gap-2 self-center font-medium">
       <img src="https://files.hvin.tech/lighting_logo.png" alt="lighting logo" className="w-[50px] h-[50px]" />         
        </a>
        <SignUpForm />
      </div>
    </div>
  )
}
