import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";

export default function SignupModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Daftar</Button>
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col items-center gap-2">
          <div
            className="bg-primary flex size-11 shrink-0 items-center justify-center rounded-full shadow-[0px_0px_24px_rgba(20,184,166,0.7)]"
            aria-hidden="true"
          >
            <Image
              src="/logo-asset-white.svg"
              width={24}
              height={24}
              alt="logo"
            />
          </div>
          <DialogHeader>
            <DialogTitle className="py-2 sm:text-center">
              Daftar untuk bergabung dengan LensFolia
            </DialogTitle>
            <DialogDescription className="text-pretty sm:text-center">
              Bergabunglah dengan layanan kami agar bisa menyimpan riwayat
              deteksi
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-3">
          <Button variant="outline" className="w-full" onClick={() => {}}>
            <Image src="/google.png" width={16} height={16} alt="Google" />
            Lanjutkan dengan Google
          </Button>
          <Button variant="outline" className="w-full" onClick={() => {}}>
            <Image
              src="/github-icon-2.svg"
              width={18}
              height={18}
              alt="Google"
            />
            Lanjutkan dengan GitHub
          </Button>
        </div>

        <p className="text-muted-foreground text-center text-xs">
          Dengan mendaftar, Anda menyetujui{" "}
          <a className="underline hover:no-underline" href="#">
            Persyaratan kami
          </a>
          .
        </p>
      </DialogContent>
    </Dialog>
  );
}
