import {
  customizePanelMarkup,
  deleteCommentModalMarkup,
  deleteModalMarkup,
  footerMarkup,
  loginModalMarkup,
  mainMarkup,
  mastheadMarkup,
  postModalMarkup,
  topBarMarkup,
} from '../content/site-markup';

type MarkupBlockProps = {
  html: string;
};

function MarkupBlock({ html }: MarkupBlockProps) {
  return <div className="markup-block" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function SiteStructure() {
  return (
    <>
      <MarkupBlock html={mastheadMarkup} />
      <MarkupBlock html={topBarMarkup} />
      <MarkupBlock html={customizePanelMarkup} />
      <MarkupBlock html={mainMarkup} />
      <MarkupBlock html={footerMarkup} />
      <MarkupBlock html={loginModalMarkup} />
      <MarkupBlock html={postModalMarkup} />
      <MarkupBlock html={deleteModalMarkup} />
      <MarkupBlock html={deleteCommentModalMarkup} />
    </>
  );
}
