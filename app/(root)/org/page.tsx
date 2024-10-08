"use client";
import DateTimeDisplay from "@/components/TimeConverter";
import {
	Card,
	CardContent,
	CardDescription,
	CardTitle,
} from "@/components/ui/card";
import useGetRoles from "@/hooks/useGetRoles";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function Page() {
	const params = useSearchParams(); // Get the query parameters
	const id = params.get("id"); // Extract the ID from the parameters
	if (!id) return <div className="pt-20">Need Id</div>;
	const { data, error, loading } = useGetRoles(id); // Fetch roles using the ID

	// Log the ID for debugging
	console.log("ID:", id);

	if (loading) {
		return <div>Loading...</div>; // Show loading state
	}

	if (error) {
		// Render the error message, assuming error is an object
		return <div>Error: An error occurred</div>;
	}

	if (!data || data.length === 0) {
		return <div>No roles found for ID {id}</div>; // Handle no data case
	}

	return (
		<div className="pt-20">
			<Card className="p-10 mx-2">
				<div className="flex justify-center items-center w-full">
					<img
						className="h-60 w-auto"
						alt={data.org.name + "img"}
						src={data.org.imageUrl}
					/>
				</div>
				<CardTitle className="p-8 m-2 text-5xl font-bold text-center">
					Organisation: {data.org.name}
				</CardTitle>
				<CardContent>
					<div className="text-center text-lg mb-20">
						Last Updated:{" "}
						{DateTimeDisplay(data.org.updatedAt).slice(0, 10)}
					</div>
					<pre className="font-sans">{data.org.description}</pre>
				</CardContent>
			</Card>
			<Card className="p-10 mx-2 my-2 grid grid-cols-3 gap-10">
				{data.roles.map((role: any, i: number) => (
					<Link
						key={i}
						href={`/role?id=${role.id}`}
						className="grid min-h-96">
						<Card className="hover:shadow-lg   bg-opacity-50 p-4 flex flex-col h-full">
							<CardTitle className="mb-5 text-lg flex justify-between px-3 font-bold text-wrap">
								{role.name}
								<div className="text-muted-foreground font-light">
									{DateTimeDisplay(role.updatedAt).slice(
										0,
										10
									)}
								</div>
							</CardTitle>
							<CardDescription className="flex-grow">
								<div>
									{role.description.length > 200 ? (
										<>
											{role.description.slice(0, 200)} ...
										</>
									) : (
										<>{role.description.slice(0, 200)} </>
									)}
								</div>
							</CardDescription>
						</Card>
					</Link>
				))}
			</Card>
		</div>
	);
}
