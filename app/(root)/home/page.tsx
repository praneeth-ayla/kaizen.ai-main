"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Page() {
	const router = useRouter();
	return (
		<div className="gap-20 h-screen flex justify-center items-center">
			<Button
				onClick={() => {
					router.push("/openings");
				}}>
				New Openings
			</Button>

			<Button
				onClick={() => {
					router.push("/past-interviews");
				}}>
				Interviews You've Attended
			</Button>
			<Button
				onClick={() => {
					router.push("/");
				}}>
				Update your details
			</Button>
		</div>
	);
}
