<?php

namespace App\Http\Controllers;


use App\Http\Requests\JsonCompareRequest;
use App\Services\JsonCompareService;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;


class JsonCompareController extends Controller {

  private JsonCompareService $jsonCompareService;


  public function __construct(JsonCompareService $jsonCompareService) {
    $this->jsonCompareService = $jsonCompareService;
  }


  public function storePayload(JsonCompareRequest $request) {

    /**
     * First payload
     */
    // store if it's the first payload
    if ($request->payload_no === 1) {
      $firstPayloadStored = $this->jsonCompareService->storeFirstPayload($request->json_content);

      return $firstPayloadStored
        ? response()->json(['success' => true, 'message' => 'First payload stored successfully.'])
        : response()->json(
          ['message' => 'Failed to store the first payload.'],
          Response::HTTP_INTERNAL_SERVER_ERROR,
        );
    }


    /**
     * Second payload
     */
    // throw error if the first payload already exists
    if ($this->jsonCompareService->isFirstPayloadExist()) {
      return response()->json(
        ['message' => 'First payload already exists, please send the second one.'],
        400,
      );
    }


    // store the second payload
    $secondPayloadStored = $this->jsonCompareService->storeSecondPayload($request->json_content);

    return $secondPayloadStored
      ? response()->json(['success' => true, 'message' => 'Second payload stored successfully.'])
      : response()->json(
        ['message' => 'Failed to store the second payload.'],
        Response::HTTP_INTERNAL_SERVER_ERROR,
      );
  }


  // TODO: comparePayloads method (use SSE)
}
