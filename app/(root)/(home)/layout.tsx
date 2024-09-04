import { Metadata } from "next";
import { ReactNode } from "react";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
	title: "Interview Mate",
	description: "With You Before, During and After Interview.",
};

const RootLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
	return (
		<main className="relative">
			<Navbar />

			<div className="flex">
				<Sidebar />

				<section className="flex min-h-screen flex-1 flex-col px-6 pb-6 pt-28 max-md:pb-14 sm:px-14">
					<div className="w-full">{children}</div>
				</section>
			</div>
		</main>
	);
};

export default RootLayout;
