export default function DynamicText({ text ,className}: { text: string; className?: string ; }) {
  const isKorean = /[가-힣]/.test(text);
  const lang = isKorean ? 'ko' : 'en';

  return <p className={className} lang={lang}>{text}</p>;
}