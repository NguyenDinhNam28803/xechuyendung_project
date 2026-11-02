import Image, { type ImageLoaderProps, type ImageProps } from "next/image";

type ContentImageProps = Omit<ImageProps, "loader" | "unoptimized">;

export default function ContentImage(props: ContentImageProps) {
  return <Image {...props} alt={props.alt} loader={contentImageLoader} unoptimized />;
}

function contentImageLoader({ src }: ImageLoaderProps) {
  return src;
}
