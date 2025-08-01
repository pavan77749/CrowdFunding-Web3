import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold underline">
        Welcome to the CrowdFunding DApp!
          <div>
      <Button className="bg-red-600">Click me</Button>
    </div>
      </h1>
    </div>
  );
}
