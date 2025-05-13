import React from "react";

export const AutosizeIframe: React.FC<{
  document: string;
}> = ({ document }) => {
  const ref = React.useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = React.useState(0);

  React.useEffect(() => {
    if (ref.current && ref.current.contentDocument) {
      setHeight(ref.current.contentDocument.body.scrollHeight);
    }
  }, [document]);

  return (
    <iframe
      ref={ref}
      srcDoc={document + "<style>body{margin:0;}</style>"}
      style={{
        width: "100%",
        height: `${height}px`,
        border: "none",
        overflow: "hidden",
      }}
      onLoad={(e) => {
        const iframe = e.currentTarget;
        if (iframe.contentDocument?.body) {
          setHeight(iframe.contentDocument.body.scrollHeight);
        }
      }}
    />
  );
};
