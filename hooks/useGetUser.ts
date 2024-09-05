import { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";

const useGetUser = () => {
	const [userData, setData] = useState<any>(null);
	const [userLoading, setLoading] = useState(true);
	const [userError, setError] = useState<any>(null);
	const { user } = useUser(); // Destructure 'user' for clarity

	const userEmail = user?.emailAddresses[0]?.emailAddress;

	useEffect(() => {
		if (!userEmail) {
			setLoading(false);
			setError(new Error("User email not available"));
			return;
		}

		const fetchData = async () => {
			setLoading(true);
			setError(null); // Reset error before new request

			try {
				const response = await axios.get(
					`${process.env.NEXT_PUBLIC_WS}/user`,
					{
						params: { email: userEmail },
					}
				);
				setData(response.data.user);
			} catch (err: any) {
				setError(err);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [userEmail]); // Add userEmail as a dependency

	return { userData, userLoading, userError };
};

export default useGetUser;
