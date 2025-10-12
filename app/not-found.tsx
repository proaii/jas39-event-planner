import { ErrorDisplay } from '@/components/error-display';

export default function NotFound() {
  return (
    <ErrorDisplay
      code="404"
      message="Page Not Found"
      description="The page you are looking for does not exist."
    />
  );
}
