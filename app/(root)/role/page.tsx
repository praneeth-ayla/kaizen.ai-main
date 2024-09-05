"use client";
import DateTimeDisplay from "@/components/TimeConverter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import useGetRole from "@/hooks/useGetRole";
import useGetUser from "@/hooks/useGetUser";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { v4 } from "uuid";
import Link from "next/link";

export default function Page() {
	const router = useRouter();
	const params = useSearchParams();
	const id = params.get("id");
	if (!id) return <div className="pt-20">Need Id</div>;

	const { data, error, loading } = useGetRole(id || "");
	const { userData, userError, userLoading } = useGetUser();
	const [disable, setDisable] = useState(true);
	const { toast } = useToast();
	const [btnMessage, setBtnMessage] = useState("Add Details");

	useEffect(() => {
		if (loading) return;

		if (userData && userData.verified) {
			if (
				userData.atsScore >= data.atsScore &&
				userData.experience >= data.experience &&
				userData.cgpa >= data.cgpa
			) {
				setDisable(false);
				setBtnMessage("Start Interview");
			} else {
				setDisable(true);
				setBtnMessage("You don't meet the requirement");
			}
		} else {
			setDisable(true);
			setBtnMessage("Add Details");
		}
	}, [loading, userData, data]);

	if (loading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>Error: An error occurred</div>;
	}

	if (!data) {
		return <div>No role found for ID {id}</div>;
	}

	async function handleInterviewStart() {
		const id = v4();
		const mockId = `/interview-ai/${id}`;

		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_WS}/setDescription`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						description: data.description,
						meetingRoomId: mockId,
						roleId: data.id,
						email: userData.email,
					}),
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.message || "Failed to create Interview"
				);
			}

			router.push(mockId);
		} catch (error: any) {
			console.error("Error:", error);
			toast({
				title: "Error creating Interview",
				description: error.message || "Something went wrong",
			});
		}
	}

	return (
		<div className="pt-20 flex justify-center items-center">
			<div className="p-10 mx-4 shadow-lg rounded-lg max-w-6xl">
				<Link
					href={`/org?id=${data.organizationId}`}
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

				<CardTitle className="py-20 text-6xl font-normal text-center text-gray-800 mb-6">
					<span className="font-semibold">Role:</span> {data.name}
				</CardTitle>
				<CardContent className="text-left text-gray-700">
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
					<div className="mt-10">
						<div className="font-semibold mb-3 text-xl">
							Role Description:
						</div>
						<pre className="font-sans leading-relaxed">
							{data.description}
						</pre>
					</div>
				</CardContent>
				<CardFooter className="flex justify-center items-center w-full py-10">
					<Button
						onClick={handleInterviewStart}
						disabled={disable}>
						{btnMessage}
					</Button>
				</CardFooter>
			</div>
		</div>
	);
}
