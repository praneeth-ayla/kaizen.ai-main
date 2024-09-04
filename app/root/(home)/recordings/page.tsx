import CallList from "@/components/CallList";

const PreviousPage = () => {
	return (
		<section className="flex size-full flex-col gap-10 ">
			<h1 className="text-3xl font-bold">Recordings</h1>

			<CallList type="recordings" />
		</section>
	);
};

export default PreviousPage;
