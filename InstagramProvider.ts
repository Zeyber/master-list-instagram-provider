import { IgApiClient } from "instagram-private-api";
import { ProviderOptions, Provider } from "master-list";

export interface InstagramOptions extends ProviderOptions {
  username: string;
  password: string;
  proxy?: string;
}

export const defaultOptions: ProviderOptions = {
  providerName: "Instagram",
};

export class InstagramProvider extends Provider {
  api: IgApiClient;

  constructor(public options: InstagramOptions) {
    super({
      ...defaultOptions,
      ...options,
    });
  }

  initialize(): Promise<boolean> {
    return super.initialize(async () => {
      this.api = new IgApiClient();
      this.api.state.generateDevice(this.settings.username);
      this.api.state.proxyUrl = this.settings.proxy;
      await (async () => {
        await this.api.simulate.preLoginFlow();
        await this.api.account.login(
          this.settings.username,
          this.settings.password
        );
      })();
    });
  }

  reload() {
    return super.reload(async () => {
      return await this.getMessages();
    });
  }

  async getMessages(): Promise<string[]> {
    return new Promise(async (resolve) => {
      const inbox = await this.api.feed.directInbox().items();
      const items = inbox
        .filter((thread: any) => thread.read_state > 0)
        .map((item) => item.thread_title);
      resolve(items);
    });
  }
}
