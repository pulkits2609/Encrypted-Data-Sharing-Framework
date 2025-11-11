import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UsernameInput() {
  const id = useId();

  return (
    <div className="username-wrapper">
      <Label htmlFor={id}>Username</Label>
      <Input id={id} placeholder="Enter username" type="text" />
    </div>
  );
}

