// Copyright (c) 2014 Greenheart Games Pty. Ltd. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#include "greenworks_matchmaking_workers.h"

#include <algorithm>
#include <list>

#include "nan.h"
#include "steam/steam_api.h"
#include "v8.h"

#include <stdio.h>
#include <string.h>
#include <algorithm> 
#include <cctype>
#include <locale>

#include "greenworks_utils.h"

namespace
{
	v8::Local<v8::Object> ConvertToJsObject(greenworks::Server pServer)
	{
		v8::Local<v8::Object> result = Nan::New<v8::Object>();

		Nan::Set(result, Nan::New("ip").ToLocalChecked(), Nan::New(pServer.m_unIPAddress));
		Nan::Set(result, Nan::New("query_port").ToLocalChecked(), Nan::New(pServer.m_nQueryPort));
		Nan::Set(result, Nan::New("game_port").ToLocalChecked(), Nan::New(pServer.m_nConnectionPort));
		Nan::Set(result, Nan::New("name").ToLocalChecked(), Nan::New(pServer.m_szServerName).ToLocalChecked());
		Nan::Set(result, Nan::New("version").ToLocalChecked(), Nan::New(pServer.m_nServerVersion));
		Nan::Set(result, Nan::New("players").ToLocalChecked(), Nan::New(pServer.m_nPlayers));
		Nan::Set(result, Nan::New("map").ToLocalChecked(), Nan::New(pServer.m_szMap).ToLocalChecked());
		Nan::Set(result, Nan::New("max_players").ToLocalChecked(), Nan::New(pServer.m_nMaxPlayers));
		Nan::Set(result, Nan::New("password").ToLocalChecked(), Nan::New(pServer.m_bPassword));
		Nan::Set(result, Nan::New("vac").ToLocalChecked(), Nan::New(pServer.m_bSecure));
		Nan::Set(result, Nan::New("ping").ToLocalChecked(), Nan::New(pServer.m_nPing));
		Nan::Set(result, Nan::New("tags").ToLocalChecked(), Nan::New(pServer.m_szGameTags).ToLocalChecked());
		//if (pServer.m_steamID) Nan::Set(result, Nan::New("steam_id").ToLocalChecked(), Nan::New(utils::uint64ToString(pServer.m_steamID.ConvertToUint64())).ToLocalChecked());
		return result;
	}

	/* from https://stackoverflow.com/questions/216823/whats-the-best-way-to-trim-stdstring */
	// trim from start (in place)
	static inline void ltrim(std::string &s)
	{
		s.erase(s.begin(), std::find_if(s.begin(), s.end(), [](int ch) {
			return !std::isspace(ch);
		}));
	}

	// trim from end (in place)
	static inline void rtrim(std::string &s)
	{
		s.erase(std::find_if(s.rbegin(), s.rend(), [](int ch) {
			return !std::isspace(ch);
		}).base(), s.end());
	}

	// trim from both ends (in place)
	static inline void trim(std::string &s)
	{
		ltrim(s);
		rtrim(s);
	}

}  // namespace

namespace greenworks
{
	Server::Server(gameserveritem_t *pGameServerItem)
	{
		m_unIPAddress = pGameServerItem->m_NetAdr.GetIP();
		m_nConnectionPort = pGameServerItem->m_NetAdr.GetConnectionPort();
		m_nQueryPort = pGameServerItem->m_NetAdr.GetQueryPort();
		m_nPing = pGameServerItem->m_nPing;
		//strncpy(m_szMap, pGameServerItem->m_szMap, sizeof(m_szMap));
		m_szMap = pGameServerItem->m_szMap;
		trim(m_szMap);
		m_nPlayers = pGameServerItem->m_nPlayers;
		m_nMaxPlayers = pGameServerItem->m_nMaxPlayers;
		m_nBotPlayers = pGameServerItem->m_nBotPlayers;
		m_bPassword = pGameServerItem->m_bPassword;
		m_bSecure = pGameServerItem->m_bSecure;
		m_nServerVersion = pGameServerItem->m_nServerVersion;
		//strncpy(m_szServerName, pGameServerItem->GetName(), sizeof(m_szServerName));
		m_szServerName = pGameServerItem->GetName();
		trim(m_szServerName);
		if (pGameServerItem->m_szGameTags)
		{
			//strncpy(m_szGameTags, pGameServerItem->m_szGameTags, sizeof(m_szGameTags));
			m_szGameTags = pGameServerItem->m_szGameTags;
			trim(m_szGameTags);
		}
		//m_steamID = pGameServerItem->m_steamID;
	}

	MatchmakingServersWorker::MatchmakingServersWorker(Nan::Callback *callback, Nan::Callback *progress, Nan::Callback *error, uint32 app_id): Nan::AsyncProgressQueueWorker<char>(callback, "MatchMakingServers"), progress(progress), error(error), app_id_(app_id)
	{
		completed = false;
	}

	MatchmakingServersWorker::~MatchmakingServersWorker()
	{
		delete progress;
		delete error;

		if (server_list_request)
		{
			SteamMatchmakingServers()->ReleaseRequest(server_list_request);
			server_list_request = NULL;
		}
	}

	void MatchmakingServersWorker::HandleErrorCallback()
	{
		if (!error) return;
		Nan::HandleScope scope;
		v8::Local<v8::Value> argv[] = { Nan::New(ErrorMessage()).ToLocalChecked() };
		error->Call(1, argv);
	}

	void MatchmakingServersWorker::Execute(const Nan::AsyncProgressQueueWorker<char>::ExecutionProgress& progress)
	{
		exec_progress = &progress;

		MatchMakingKeyValuePair_t pFilters[2];
		MatchMakingKeyValuePair_t *pFilter = pFilters;

		strncpy(pFilters[0].m_szKey, "gamedir", sizeof(pFilters[0].m_szKey));
		strncpy(pFilters[0].m_szValue, "dayz", sizeof(pFilters[0].m_szValue));
		strncpy(pFilters[1].m_szKey, "secure", sizeof(pFilters[1].m_szKey));
		strncpy(pFilters[1].m_szValue, "1", sizeof(pFilters[1].m_szValue));

		ISteamMatchmakingServerListResponse* server_list_response = new ServerListResponse(this);

		server_list_request = SteamMatchmakingServers()->RequestInternetServerList(0, &pFilter, ARRAYSIZE(pFilters), server_list_response);

		//server_list_request = SteamMatchmakingServers()->RequestFriendsServerList(0, &pFilter, 0, server_list_response);

		WaitForCompleted();
	}

	void MatchmakingServersWorker::ReleaseRequest()
	{
		if (server_list_request)
		{
			SteamMatchmakingServers()->ReleaseRequest(server_list_request);
			server_list_request = NULL;
		}
	}

	void MatchmakingServersWorker::WaitForCompleted()
	{
		while (!completed)
		{
			// sleep 100ms.
			utils::sleep(100);
		}
	}

	void MatchmakingServersWorker::Progress(Server server)
	{
		server_list.push_back(server);
		num_servers++;
		exec_progress->Send(reinterpret_cast<const char*>(&num_servers), num_servers);
	}

	void MatchmakingServersWorker::Complete()
	{
		completed = true;
		this->ReleaseRequest();
		//this->HandleOKCallback();
	}

	void MatchmakingServersWorker::HandleProgressCallback(const char *data, size_t count)
	{
		Nan::HandleScope scope;

		v8::Local<v8::Value> argv[] = { ConvertToJsObject(server_list[num_servers - 1]), Nan::New<v8::Integer>(*reinterpret_cast<int*>(const_cast<char*>(data))) };
		progress->Call(2, argv, async_resource);
	}

	void MatchmakingServersWorker::HandleOKCallback()
	{
		Nan::HandleScope scope;

		v8::Local<v8::Array> servers = Nan::New<v8::Array>(static_cast<int>(server_list.size()));
		for (size_t i = 0; i < server_list.size(); ++i)
		{
			Nan::Set(servers, i, ConvertToJsObject(server_list[i]));
		}
			
		v8::Local<v8::Value> argv[] = { servers, Nan::New(num_servers) };
		callback->Call(2, argv, async_resource);
	}

	ServerListResponse::ServerListResponse(MatchmakingServersWorker* worker)
	{
		servers_worker = worker;
	}

	void ServerListResponse::ServerResponded(HServerListRequest hReq, int iServer)
	{
		gameserveritem_t *pServer = SteamMatchmakingServers()->GetServerDetails(hReq, iServer);
		if (pServer)
		{
			Server item = Server(pServer);
			servers_worker->Progress(item);

			if (pServer->m_nAppID == SteamUtils()->GetAppID())
			{
			}
		}
	}

	void ServerListResponse::ServerFailedToRespond(HServerListRequest hReq, int iServer)
	{
	}

	void ServerListResponse::RefreshComplete(HServerListRequest hReq, EMatchMakingServerResponse response)
	{
		servers_worker->Complete();
	}

	//void ServerRulesResponse::

}  // namespace greenworks
