"use client";
import DateTimeDisplay from "@/components/TimeConverter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardContent, CardTitle } from "@/components/ui/card";
import useGetRole from "@/hooks/useGetRole";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function Page() {
	const params = useSearchParams(); // Get the query parameters
	const id = params.get("id"); // Extract the ID from the parameters
	if (!id) return <div className="pt-20">Need Id</div>;
	const { data, error, loading } = useGetRole(id); // Fetch roles using the ID
	const { userData, userError, userLoading } = useGetUser();

	// Log the ID for debugging

	if (loading) {
		return <div>Loading...</div>; // Show loading state
	}

	if (error) {
		// Render the error message, assuming error is an object
		return <div>Error: An error occurred</div>;
	}

	if (!data || data.length === 0) {
		return <div>No role found for ID {id}</div>; // Handle no data case
	}

	return (
		<div className="pt-20 flex justify-center items-center">
			<div className="p-10 mx-4 shadow-lg rounded-lg max-w-6xl">
				<Link
					href={"/org?id=" + data.organizationId}
					className="flex gap-3 text-xl items-center">
					<Avatar>
						<AvatarImage
							src={data?.organization.imageUrl ?? undefined}
						/>
						<AvatarFallback>
							{data?.organization.name?.charAt(0).toUpperCase() ??
								undefined}
						</AvatarFallback>
					</Avatar>
					<div>{data?.organization.name}</div>
				</Link>

				<CardTitle className="text-4xl font-normal text-center text-gray-800 mb-6">
					<span className="font-semibold">Role:</span> {data.name}
				</CardTitle>
				<CardContent className="text-left text-xl text-gray-700">
					<div className="mb-6">
						<div className="text-lg mb-2">
							<span className="font-semibold">Created:</span>{" "}
							{DateTimeDisplay(data.createdAt).slice(0, 10)}
						</div>
						<div className="text-lg mb-2">
							<span className="font-semibold">Last Updated:</span>{" "}
							{DateTimeDisplay(data.updatedAt).slice(0, 10)}
						</div>
						<div className="text-lg mb-2">
							<span className="font-semibold">
								Min Experience:
							</span>{" "}
							{data.experience} years
						</div>
						<div className="text-lg mb-2">
							<span className="font-semibold">Min CGPA:</span>{" "}
							{data.cgpa}
						</div>
						<div className="text-lg mb-2">
							<span className="font-semibold">
								Min ATS Score:
							</span>{" "}
							{data.atsScore}
						</div>
					</div>
					<div className="text-lg leading-relaxed">
						{data.description}
					</div>
				</CardContent>
			</div>
		</div>
	);
}
