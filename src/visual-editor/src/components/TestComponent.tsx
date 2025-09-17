interface TestComponentProps {
  message?: string;
}

export const TestComponent: React.FC<TestComponentProps> = ({
  message = 'Vite HMR is working!',
}) => {
  return (
    <div style={{ padding: '10px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>Test Component</h3>
      <p>{message}</p>
    </div>
  );
};
