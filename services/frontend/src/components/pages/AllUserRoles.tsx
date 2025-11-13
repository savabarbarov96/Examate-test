import UserRoles from "@/components/AllUserRolesTable";
import { Card, CardContent } from "@/components/ui/auth/card";

const UserRolesPage = () => {
  return (
    <div className="flex justify-center p-6 bg-gray-50 min-h-screen">
      <Card className="w-full max-w-6xl shadow-lg">
        <CardContent className="p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800">
            User Roles & Permissions
          </h1>
          <UserRoles />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserRolesPage;
