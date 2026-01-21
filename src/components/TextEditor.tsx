"use client";

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
}

export default function TextEditor({
  value,
  onChange,
  placeholder,
  disabled = false,
  readOnly = false,
}: TextEditorProps) {
  return (
    <div className="relative h-[350px] md:h-[400px]">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className={`
          custom-textarea
          w-full h-full
          p-4
          rounded-xl
          text-white/90
          placeholder-white/30
          resize-none
          font-mono text-sm
          leading-relaxed
          ${disabled || readOnly ? "opacity-70 cursor-not-allowed" : ""}
        `}
        spellCheck={false}
      />
      
      {/* Gradient border effect */}
      <div className="absolute inset-0 rounded-xl pointer-events-none">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/20 to-accent-500/20 opacity-0 hover:opacity-100 transition-opacity" style={{ padding: '1px' }}>
          <div className="w-full h-full rounded-xl bg-[#0a0a14]" />
        </div>
      </div>
    </div>
  );
}
