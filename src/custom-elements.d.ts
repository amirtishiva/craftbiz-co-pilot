declare namespace JSX {
  interface IntrinsicElements {
    'zapier-interfaces-chatbot-embed': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      'is-popup'?: string;
      'chatbot-id'?: string;
      'tracked-params'?: string;
    }, HTMLElement>;
  }
}
