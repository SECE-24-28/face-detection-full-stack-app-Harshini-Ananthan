type FaceBoxProps = {
  box: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
};

export default function FaceBox({ box }: FaceBoxProps) {
  return (
    <div
      className="absolute border-2 border-lime-400 bg-lime-400/10"
      style={{
        top: `${box.top}px`,
        left: `${box.left}px`,
        width: `${box.width}px`,
        height: `${box.height}px`,
      }}
    />
  );
}
