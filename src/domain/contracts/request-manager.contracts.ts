export interface IRequestManager {
  /**
   * @description Initializes the request manager.
   * @returns {void}
   */
  initRequest(): void
  /**
   * @description Stops the request manager.
   * @returns {void}
   */
  stopRequest(): void
}
