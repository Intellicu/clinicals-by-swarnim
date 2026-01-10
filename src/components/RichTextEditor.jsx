import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ color: [] }, { background: [] }],
    ["link", "image"],
    ["blockquote", "code-block"],
    [{ align: [] }],
    ["clean"]
  ]
};

const formats = [
  "header",
  "bold", "italic", "underline", "strike",
  "list", "bullet", "indent",
  "color", "background",
  "link", "image",
  "blockquote", "code-block",
  "align"
];

export default function RichTextEditor({ value, onChange, placeholder, className }) {
  return (
    <div className={className}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="bg-white"
      />
    </div>
  );
}