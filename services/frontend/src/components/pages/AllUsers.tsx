import AllUsers from "@/components/AllUsersTable";

const AllUsersPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-6">
      <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-8">
        <AllUsers />
      </div>
    </div>
  );
};

export default AllUsersPage;
