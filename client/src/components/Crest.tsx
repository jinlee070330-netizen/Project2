interface CrestProps {
  src?: string;
  name: string;
  size?: number;
}

export default function Crest({ src, name, size = 40 }: CrestProps) {
  if (!src) {
    return (
      <span className="crest crest-fallback" style={{ width: size, height: size }} aria-hidden="true">
        {name.charAt(0)}
      </span>
    );
  }
  return <img className="crest" src={src} alt="" width={size} height={size} loading="lazy" />;
}
