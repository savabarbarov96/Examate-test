import { CreateUserForm } from "@/components/CreateUserForm";

const CreateUserPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-3xl">
        <CreateUserForm />
      </div>
    </div>
  );
};

export default CreateUserPage;
