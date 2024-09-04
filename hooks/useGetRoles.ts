import { useState, useEffect } from "react";
import axios from "axios";

const useGetRoles = (id: string) => {
	const [data, setData] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await axios.get(
					process.env.NEXT_PUBLIC_WS + "/org/roles?id=" + id
				);
				setData(response.data);
				setLoading(false);
			} catch (err: any) {
				setError(err);
				setLoading(false);
			}
		};

		fetchData();
	}, []); // Re-run the effect if the URL changes

	return { data, loading, error };
};

export default useGetRoles;
