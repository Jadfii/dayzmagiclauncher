#ifndef SRC_GREENWORKS_MATCHMAKING_WORKERS_H_
#define SRC_GREENWORKS_MATCHMAKING_WORKERS_H_

#include "steam_async_worker.h"

#include <vector>
#include <list>
#include "v8.h"

#include "steam/steam_api.h"

namespace greenworks
{
	class Server
	{
		public:
			Server(gameserveritem_t *pGameServerItem);

			const char* GetName() { return m_szServerName; }

			const char* GetDisplayString() { return m_szServerString; }

			uint32 GetIP() { return m_unIPAddress; }

			int32 GetPort() { return m_nConnectionPort; }

			uint32 m_unIPAddress;			// IP address for the server
			int32 m_nConnectionPort;		// Port for game clients to connect to for this server
			int m_nPing;					// current ping time in milliseconds
			char m_szMap[32];				// current map
			char m_szGameDescription[64];	// game description
			int m_nPlayers;					// current number of players on the server
			int m_nMaxPlayers;				// Maximum players that can join this server
			int m_nBotPlayers;				// Number of bots (i.e simulated players) on this server
			bool m_bPassword;				// true if this server needs a password to join
			bool m_bSecure;					// Is this server protected by VAC
			int	m_nServerVersion;			// server version as reported to Steam
			char m_szServerName[64];		// Game server name
			char m_szServerString[128];		// String to show in server browser
	};

	class MatchmakingServersWorker : public Nan::AsyncProgressQueueWorker<char>
	{
		public:
			MatchmakingServersWorker(Nan::Callback *callback, Nan::Callback *progress, Nan::Callback *error, uint32 app_id);
			~MatchmakingServersWorker();

			void ReleaseRequest();
			void Execute(const Nan::AsyncProgressQueueWorker<char>::ExecutionProgress& progress) override;
			void HandleProgressCallback(const char *data, size_t count) override;
			void HandleOKCallback() override;

			void HandleErrorCallback();

			void Progress(Server server);
			void Complete();

			void WaitForCompleted();

		private:
			uint32 app_id_;
			Nan::Callback *progress;
			Nan::Callback *error;
			HServerListRequest server_list_request;

			const Nan::AsyncProgressQueueWorker<char>::ExecutionProgress *exec_progress;

			bool completed;
			int num_servers;
			std::vector<Server> server_list;
	};

	class ServerListResponse : public ISteamMatchmakingServerListResponse
	{
		public:
			ServerListResponse(MatchmakingServersWorker* worker);
			void GetInternetServers();
			void ReleaseRequest();

			void ServerResponded(HServerListRequest hReq, int iServer);
			void ServerFailedToRespond(HServerListRequest hReq, int iServer);
			void RefreshComplete(HServerListRequest hReq, EMatchMakingServerResponse response);

		private:
			MatchmakingServersWorker* servers_worker;
			HServerListRequest server_list_request;

			MatchMakingKeyValuePair_t filters_;
			uint32 num_filters_;

			bool running;
			int num_servers;
			std::vector<Server> server_list;
	};

}  // namespace greenworks

#endif  // SRC_GREENWORKS_MATCHMAKING_WORKERS_H_
