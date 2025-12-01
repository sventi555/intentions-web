import placeholder from '../assets/images/placeholder-dp.jpg';
import { useDownloadUrl } from '../hooks/download-url';

interface DisplayPicProps {
  imageUri: string | undefined;
  size: number;
}

export const DisplayPic: React.FC<DisplayPicProps> = (props) => {
  const { downloadUrl: dpUrl } = useDownloadUrl(props.imageUri);

  return (
    <img
      src={dpUrl ?? placeholder}
      style={{
        minWidth: props.size,
        width: props.size,
        minHeight: props.size,
        height: props.size,
      }}
      className="rounded-full object-cover"
    />
  );
};
