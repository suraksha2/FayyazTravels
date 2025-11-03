"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ToggleLeft as Google } from "lucide-react"

export function LoginDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-[#C69C3C]">
            LOG IN
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full"
            />
          </div>
          <Button className="w-full bg-[#C69C3C] hover:bg-[#B38C2C] text-white">
            Sign in
          </Button>
          <div className="text-center">
            <a href="#" className="text-sm text-[#C69C3C] hover:underline">
              Forgotten your password?
            </a>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => {}}>
            <Google className="mr-2 h-4 w-4" />
            Log in with Google
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            By continuing, you agree to our{" "}
            <a href="#" className="text-[#C69C3C] hover:underline">
              Terms & Conditions
            </a>{" "}
            and{" "}
            <a href="#" className="text-[#C69C3C] hover:underline">
              Privacy Policy
            </a>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">Haven&apos;t signed up yet?</p>
            <a href="#" className="text-[#C69C3C] hover:underline">
              Create your account here
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}