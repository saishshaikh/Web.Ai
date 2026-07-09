import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";

function LiveSite() {
  const { slug } = useParams();

  const [html, setHtml] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleGetWebsite = async () => {
      try {
        setLoading(true);

        const result = await axios.get(
          `${serverUrl}/api/website/get-by-slug/${slug}`,
          {
            withCredentials: true,
          }
        );

        setHtml(result.data.latestCode);

      } catch (err) {
        console.error(err);
        setError("site not found");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      handleGetWebsite();
    }
  }, [slug]);


  if (loading) {
    return <div>Loading...</div>;
  }


  if (error) {
    return <div>404 - {error}</div>;
  }


  const blob = new Blob([html], {
    type: "text/html",
  });

  const url = URL.createObjectURL(blob);


  return (
    <iframe
      src={url}
      title="Live Website"
      style={{
        width: "100%",
        height: "100vh",
        border: "none",
      }}
    />
  );
}

export default LiveSite;