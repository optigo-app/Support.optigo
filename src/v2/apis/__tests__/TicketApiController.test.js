import { BaseAPI } from "../BaseAPI";
import TicketAPI from "../TicketApiController";

const ok = { rd: [{ stat: 1, stat_msg: "Record updated successfully." }] };
const sentParams = () => BaseAPI.requestToApi.mock.calls[0][0].params;

describe("TicketAPI.updateTicket", () => {
  beforeEach(() => {
    jest.spyOn(BaseAPI, "requestToApi").mockResolvedValue(ok);
    jest.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it("sends numeric ids and 1/0 bits", async () => {
    await TicketAPI.updateTicket({ ticketNo: "J39001", statusId: "7", appId: 1, cateId: "1", createdBy: 23, star: false, suggested: true, sendEmail: 0 });
    expect(sentParams()).toMatchObject({ TicketNo: "J39001", StatusId: 7, AppId: 1, CateId: 1, CreatedBy: 23, Star: 0, IsSuggested: 1, SendEmail: 0 });
  });


  it("leaves unprovided fields blank and turns NaN into blank", async () => {
    await TicketAPI.updateTicket({ ticketNo: "J39001", createdBy: 23, sendEmail: NaN });
    expect(sentParams()).toMatchObject({ StatusId: "", AppId: "", PriorityId: "", SendEmail: "", Star: "", IsSuggested: "" });
  });

  it("rejects a label sent as an id before any request is made", async () => {
    await expect(TicketAPI.updateTicket({ ticketNo: "J39001", appId: "Master & Policy", createdBy: 23 })).rejects.toThrow(/Invalid AppId/);
    expect(BaseAPI.requestToApi).not.toHaveBeenCalled();
  });

  it("throws the server message when stat is 0 (HTTP 200 failure)", async () => {
    BaseAPI.requestToApi.mockResolvedValue({ rd: [{ stat: 0, stat_msg: "TicketNo does not exist.", stat_code: 1001 }] });
    await expect(TicketAPI.updateTicket({ ticketNo: "J39001", createdBy: 23 })).rejects.toThrow("TicketNo does not exist.");
  });

  it("throws when the response has no result row", async () => {
    BaseAPI.requestToApi.mockResolvedValue(undefined);
    await expect(TicketAPI.updateTicket({ ticketNo: "J39001", createdBy: 23 })).rejects.toThrow(/Failed to update ticket/);
  });
});
