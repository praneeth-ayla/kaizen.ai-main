"use client";

import Loader from "@/components/Loader";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import useGetOrg from "@/hooks/useGetOrg";
import Link from "next/link";

export default function Home() {
	const { data, error, loading } = useGetOrg();

	if (loading) {
		return (
			<div>
				<Loader />
			</div>
		);
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	// Check if data is available and properly structured
	if (!data || data.length === 0) {
		return <div>No data available</div>;
	}

	return (
		<div>
			<div className="pt-20 text-center text-4xl">New Openings</div>

			<div className="flex gap-10 p-10 m-2">
				{data.map((org: any, index: number) => (
					<Link
						key={index}
						href={`/org?id=${org.id}`}
						className="grid">
						<Card className="hover:shadow-lg   bg-opacity-50 p-4 flex flex-col h-full">
							<div className="object-cover flex justify-center items-center">
								<img
									className="rounded-t-lg h-32 w-auto object-cover"
									src={org.imageUrl}
									alt={org.name + " logo"}
								/>
							</div>
							<CardTitle className="mb-2 text-lg font-bold text-wrap text-center">
								{org.name}
							</CardTitle>
							<CardDescription className="flex-grow">
								{/* <div className="flex gap-1 pt-4">
								<StarRating rating={schoolDetail.rating} />
								{schoolDetail.rating}
							</div> */}
								<div className="text-xs">
									{org.description.length > 200 ? (
										<>{org.description.slice(0, 200)} ...</>
									) : (
										<>{org.description.slice(0, 200)} </>
									)}
								</div>
							</CardDescription>
						</Card>
					</Link>
				))}
			</div>
		</div>
	);
}
